import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, interval, switchMap, takeWhile, catchError } from 'rxjs';
import { ScanRequest, ScanResult, FixSuggestion, GraphData, RootCauseComponent, WcagGraphCriteria, AriaHiddenCascade } from '../models/scan.models';

@Injectable({ providedIn: 'root' })
export class ScanService {
  private readonly backendUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  startScan(request: ScanRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.backendUrl}/scans`, request).pipe(
      catchError(this.handleError)
    );
  }

  getScan(id: string): Observable<ScanResult> {
    return this.http.get<ScanResult>(`${this.backendUrl}/scans/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  pollScan(id: string): Observable<ScanResult> {
    return interval(2000).pipe(
      switchMap(() => this.getScan(id)),
      takeWhile(result => result.status === 'PENDING' || result.status === 'SCANNING', true)
    );
  }

  getFixSuggestion(ruleId: string): Observable<FixSuggestion> {
    return this.http.get<FixSuggestion>(`${this.backendUrl}/fixes/${ruleId}`).pipe(
      catchError(this.handleError)
    );
  }

  getDemoResults(): Observable<ScanResult> {
    return this.http.get<ScanResult>(`${this.backendUrl}/demo`).pipe(
      catchError(this.handleError)
    );
  }

  getReportUrl(scanId: string): string {
    return `${this.backendUrl}/scans/${scanId}/report`;
  }

  downloadReport(scanId: string): void {
    window.open(this.getReportUrl(scanId), '_blank');
  }

  /** Export violations as CSV and trigger browser download */
  downloadCsv(result: ScanResult): void {
    const headers = ['Rule ID', 'Impact', 'Description', 'Help', 'Affected Elements', 'WCAG Tags', 'Help URL'];
    const rows = (result.violations || []).map(v => [
      v.id,
      v.impact || '',
      v.description,
      v.help,
      String(v.nodeCount || 0),
      (v.tags || []).join(' '),
      v.helpUrl,
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    this.triggerDownload(csv, `accessibility-report-${result.id}.csv`, 'text/csv');
  }

  /** Export full scan result as JSON */
  downloadJson(result: ScanResult): void {
    const json = JSON.stringify(result, null, 2);
    this.triggerDownload(json, `accessibility-report-${result.id}.json`, 'application/json');
  }

  // ── Neo4j Graph API ──────────────────────────────────────────────────────

  getDomGraph(scanId: string): Observable<GraphData> {
    return this.http.get<GraphData>(`${this.backendUrl}/scans/${scanId}/graph`).pipe(
      catchError(this.handleError)
    );
  }

  getRootCauses(scanId: string): Observable<RootCauseComponent[]> {
    return this.http.get<RootCauseComponent[]>(`${this.backendUrl}/scans/${scanId}/graph/root-causes`).pipe(
      catchError(this.handleError)
    );
  }

  getAriaHiddenCascades(scanId: string): Observable<AriaHiddenCascade[]> {
    return this.http.get<AriaHiddenCascade[]>(`${this.backendUrl}/scans/${scanId}/graph/aria-hidden-cascades`).pipe(
      catchError(this.handleError)
    );
  }

  getWcagGraphRoadmap(scanId: string): Observable<WcagGraphCriteria[]> {
    return this.http.get<WcagGraphCriteria[]>(`${this.backendUrl}/scans/${scanId}/graph/wcag-roadmap`).pipe(
      catchError(this.handleError)
    );
  }

  /** Copy text to clipboard */
  copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return Promise.resolve();
  }

  private triggerDownload(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Cannot connect to the AccessLens backend. Please ensure the server is running on port 8081.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 400) {
      message = error.error?.error || 'Invalid request. Please check the URL and try again.';
    } else if (error.status === 404) {
      message = 'Scan not found.';
    } else if (error.status === 429) {
      message = 'Too many scan requests. Please wait a moment and try again.';
    }
    return throwError(() => new Error(message));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, interval, switchMap, takeWhile, catchError, of } from 'rxjs';
import { ScanRequest, ScanResult, FixSuggestion } from '../models/scan.models';

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

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Cannot connect to the AccessLens backend. Please ensure the server is running on port 8080.';
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

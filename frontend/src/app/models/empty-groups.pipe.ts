import { Pipe, PipeTransform } from '@angular/core';
import { ImpactGroup } from './scan.models';

@Pipe({ name: 'emptyGroups', standalone: true })
export class EmptyGroupsPipe implements PipeTransform {
  transform(groups: ImpactGroup[]): boolean {
    return groups.every(g => g.violations.length === 0);
  }
}

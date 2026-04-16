import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { MeasurementRecord } from '../../core/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  records = signal<MeasurementRecord[]>([]);
  loading = signal(true);
  error = signal('');
  filterOp = signal('ALL');

  operations = ['ALL', 'CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE'];

  filtered = computed(() => {
    const op = this.filterOp();
    if (op === 'ALL') return this.records();
    return this.records().filter(r => r.operation === op);
  });

  getOperationCount(op: string): number {
    if (op === 'ALL') return this.records().length;
    return this.records().filter(r => r.operation === op).length;
  }

  constructor(public auth: AuthService, private svc: MeasurementService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getHistory().subscribe({
      next: data => {
        this.records.set(data.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        this.loading.set(false);
      },
      error: e => {
        this.error.set(e.error?.message || 'Failed to load history.');
        this.loading.set(false);
      },
    });
  }

  formatDate(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatRecord(r: MeasurementRecord): string {
    const op = r.operation;
    const v1 = r.operand1_Value;
    const u1 = r.operand1_Unit;
    const v2 = r.operand2_Value;
    const u2 = r.operand2_Unit;
    const rv = r.result_Value !== undefined && r.result_Value !== null ? this.fmt(r.result_Value) : '?';
    const ru = r.result_Unit || '';

    if (op === 'CONVERT') return `${v1} ${u1} → ${rv} ${ru}`;
    if (op === 'ADD') return `${v1} ${u1} + ${v2} ${u2} = ${rv} ${ru}`;
    if (op === 'SUBTRACT') return `${v1} ${u1} − ${v2} ${u2} = ${rv} ${ru}`;
    if (op === 'DIVIDE') return `${v1} ${u1} ÷ ${v2} ${u2} = ${rv}`;
    if (op === 'COMPARE') return `${v1} ${u1} ≟ ${v2} ${u2} → ${r.hasError ? 'Error' : (rv === '1' ? 'Equal' : 'Not Equal')}`;
    return `${op}: ${v1} ${u1}`;
  }

  fmt(v: number): string {
    if (Number.isInteger(v)) return v.toString();
    return parseFloat(v.toFixed(6)).toString();
  }

  opColor(op: string): string {
    const map: Record<string, string> = {
      CONVERT: 'blue',
      ADD: 'green',
      SUBTRACT: 'orange',
      DIVIDE: 'purple',
      COMPARE: 'pink',
    };
    return map[op] || 'gray';
  }

  opSymbol(op: string): string {
    const map: Record<string, string> = {
      CONVERT: '→', ADD: '+', SUBTRACT: '−', DIVIDE: '÷', COMPARE: '≟',
    };
    return map[op] || '·';
  }
}

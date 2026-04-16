import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConvertRequest,
  ArithmeticRequest,
  CompareRequest,
  MeasurementResponse,
  MeasurementRecord,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  private base = `${environment.apiUrl}/api/quantitymeasurement`;

  constructor(private http: HttpClient) {}

  convert(req: ConvertRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(`${this.base}/convert`, req);
  }

  compare(req: CompareRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(`${this.base}/compare`, req);
  }

  add(req: ArithmeticRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(`${this.base}/add`, req);
  }

  subtract(req: ArithmeticRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(`${this.base}/subtract`, req);
  }

  divide(req: ArithmeticRequest): Observable<MeasurementResponse> {
    return this.http.post<MeasurementResponse>(`${this.base}/divide`, req);
  }

  getHistory(): Observable<MeasurementRecord[]> {
    return this.http.get<MeasurementRecord[]>(`${this.base}/history`);
  }
}

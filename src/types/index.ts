export interface TestParameter {
    id: number;
    test_id: number;
    param_name: string;
    unit: string;
    min_range: number;
    max_range: number;
    gender_specific: number; // 0: All, 1: Male, 2: Female
}

export interface ReportResult {
    parameter_id: number;
    test_id?: number;
    result_value: string;
    status: 'LOW' | 'NORMAL' | 'HIGH';
    remarks?: string;
    param_name?: string; // Optional for UI display joining
    unit?: string;
    min_range?: number;
    max_range?: number;
    gender_specific?: number;
    test_name?: string;
}

export interface Report {
    id: number;
    patient_id: number;
    patient_name: string; // Joined
    patient_age: number;
    patient_gender: string;
    patient_phone: string;
    test_ids: number[];
    test_names: string; // Joined
    total_amount: number;
    status: 'DRAFT' | 'FINAL';
    referring_doctor?: string;
    sample_collection_date?: string;
    sample_number?: string;
    bill_number?: string;
    reference_source?: string;
    created_at: string;
    results: ReportResult[];
}

export interface TestResult {
    parameter_id: number;
    result_value: string;
    status: 'LOW' | 'NORMAL' | 'HIGH';
    remarks?: string;
}

export interface Patient {
    id?: number;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface Test {
    id: number;
    test_name: string;
    price: number;
}

export interface User {
    id: number;
    username: string;
    full_name: string;
    role: string;
}

export interface Settings {
    lab_name: string;
    address_line1: string;
    address_line2: string;
    phone: string;
    email: string;
    website: string;
}

export interface LicenseStatus {
    tier: 'FREE' | 'PRO';
    monthlyUsage: number;
    limit: number;
}

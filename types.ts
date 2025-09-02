
export interface AreaRug {
    id: number;
    sqft: number;
}

export interface JobDetails {
    distance: number;
    sqft: number;
    petTreatmentRooms: number;
    clientType: 'first-time' | 'repeat';
    largeItems: number;
    smallItems: number;
    areaRugs: AreaRug[];
    floors: number;
    hours: number;
    initialDiscount: number;
    petStainSpots: number;
    stainGuardRooms: number;
    membership: 'none' | '6-month' | '1-year';
    sofas: number;
    loveSeats: number;
    armchairs: number;
}

export interface Deal {
    id: string;
    title: string;
    description: string;
    requiresFollowUp?: boolean | ((details: JobDetails) => boolean);
    followUpQuestion?: string;
    followUpType?: 'number' | 'text' | 'upholstery';
    followUpTarget?: keyof JobDetails;
}

export interface DealResponse {
    id: string;
    accepted: boolean;
    details: string | number;
}

export interface AppState {
    step: 'description' | 'form' | 'deals' | 'summary' | 'email';
    jobDetails: JobDetails;
    dealResponses: DealResponse[];
    isLoading: boolean;
    error: string | null;
}

export type AppAction =
    | { type: 'START_LOADING' }
    | { type: 'SET_STEP'; payload: AppState['step'] }
    | { type: 'SET_JOB_DETAILS'; payload: Partial<JobDetails> }
    | { type: 'UPDATE_JOB_DETAIL'; payload: { key: keyof JobDetails; value: any } }
    | { type: 'SET_DEAL_RESPONSES'; payload: DealResponse[] }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET' };

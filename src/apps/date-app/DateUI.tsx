export interface AppInputs {
    date?: string;
}

export function DateUI({ date = "N/A" }: AppInputs) {
    return <div>Current date: {date}</div>;
}

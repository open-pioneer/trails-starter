export interface AppInputs {
    date?: string;
}

export function DateUI({ date = "empty" }: AppInputs) {
    return <div>{date}</div>;
}

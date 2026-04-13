import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkspacePlan {
    pro = "pro",
    free = "free"
}
export interface backendInterface {
    adminGetUserWorkspacePlan(user: Principal): Promise<WorkspacePlan>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWorkspacePlan(): Promise<WorkspacePlan>;
    getUsername(): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    selectWorkspacePlan(plan: WorkspacePlan): Promise<void>;
    setUsername(name: string): Promise<void>;
}

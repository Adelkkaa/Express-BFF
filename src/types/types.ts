export interface AuthResult {
  access_token: string;
  refresh_token: string;
  info_token: string;
}

export interface IInfoToken {
  kan_uid: number;
  employee_guid: string;
  full_name: string;
  login_ad: string;
}

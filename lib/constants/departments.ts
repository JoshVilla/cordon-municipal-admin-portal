export const DEPARTMENTS = [
  { value: "om", label: "Office of the Mayor" },
  { value: "ovm", label: "Office of the Vice Mayor" },
  { value: "sb", label: "Sangguniang Bayan" },
  { value: "ma", label: "Municipal Administrator" },
  { value: "mcr", label: "Municipal Civil Registrar" },
  { value: "mto", label: "Municipal Treasurer" },
  { value: "mao_assessor", label: "Municipal Assessor" },
  { value: "macco", label: "Municipal Accountant" },
  { value: "mbo", label: "Municipal Budget Officer" },
  { value: "mpdo", label: "Municipal Planning & Development" },
  { value: "mswd", label: "Municipal Social Welfare & Development" },
  { value: "mho", label: "Municipal Health Office" },
  { value: "mao_agri", label: "Municipal Agriculture Office" },
  { value: "menro", label: "Municipal Environment & Natural Resources" },
  { value: "meo", label: "Municipal Engineering Office" },
  { value: "bfp", label: "Bureau of Fire Protection" },
  { value: "pnp", label: "Philippine National Police" },
  { value: "mdrrmo", label: "Disaster Risk Reduction & Management" },
  { value: "hrmo", label: "Human Resource Management" },
  { value: "mio", label: "Municipal Information Office" },
  { value: "bplo", label: "Business Permits & Licensing" },
  { value: "tourism", label: "Tourism Office" },
  { value: "mcdo", label: "Cooperative Development Office" },
  { value: "osca", label: "Senior Citizens Affairs" },
]

export const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "mayors_office", label: "Mayor's Office Staff" },
  { value: "document_staff", label: "Document Staff" },
  { value: "complaint_staff", label: "Complaint Staff" },
  { value: "it_admin", label: "IT Admin" },
  { value: "viewer", label: "Viewer (Read Only)" },
]

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin:    ["ACD", "ADR", "MC", "PA", "MSA", "MSS", "VRA"],
  mayors_office:  ["ACD", "VRA", "PA"],
  document_staff: ["ACD", "ADR", "VRA"],
  complaint_staff:["ACD", "MC", "VRA"],
  it_admin:       ["MSA", "MSS", "VRA"],
  viewer:         ["VRA"],
}

export const PERMISSION_LABELS: Record<string, string> = {
  ACD: "Access Citizen Database",
  ADR: "Approve Document Requests",
  MC:  "Manage Complaints",
  PA:  "Post Announcements",
  MSA: "Manage Staff Accounts",
  MSS: "Manage System Settings",
  VRA: "View Reports & Analytics",
}


export const PERMISSION_META: Record<string, { icon: string; desc: string }> = {
  ACD: { icon: "Database",     desc: "Full read/write access to population registries." },
  ADR: { icon: "CheckCircle2", desc: "Authority to validate and finalize public service applications." },
  MC:  { icon: "FileText",     desc: "Handle and resolve citizen complaints and incident reports." },
  PA:  { icon: "Megaphone",    desc: "Publish bulletins and alerts to the citizen portal." },
  MSA: { icon: "Users",        desc: "Ability to assign roles and manage administrative accounts." },
  MSS: { icon: "Settings",     desc: "Configure global portal parameters and integrations." },
  VRA: { icon: "BarChart2",    desc: "Access to real-time service performance dashboards." },
}
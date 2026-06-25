type ServiceJoin = { name: string } | { name: string }[] | null;

export function getJoinedServiceName(services: ServiceJoin): string {
  if (!services) return "";
  if (Array.isArray(services)) return services[0]?.name ?? "";
  return services.name;
}

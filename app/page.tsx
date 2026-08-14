import ServiceCard from "@/components/serviceCard";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Universal Tools</h1>

        <p className="mt-2 text-gray-600">
          Simple tools. Fast. Free.
        </p>

        <div className="mt-10 space-y-4">
          {services
            .filter((service) => service.enabled)
            .map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
        </div>
      </div>
    </main>
  );
}

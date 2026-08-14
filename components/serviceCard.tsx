import Link from "next/link";
import { Service } from "@/data/services";

type Props = {
  service: Service;
};

export default function ServiceCard({ service }: Props) {
  return (
    <Link href={service.route}>
      <div className="rounded-xl border border-gray-200 p-6 hover:bg-gray-50 transition cursor-pointer">
        <h2 className="text-xl font-semibold">{service.title}</h2>

        <p className="mt-2 text-gray-600">
          {service.description}
        </p>
      </div>
    </Link>
  );
}
import Link from "next/link";

export type Land = {
  title: string
  size: string
  price: string
  href: string
}

export default function LandCard({ land }: { land: Land }) {
  return (
    <Link
      href={land.href}
      className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
    >
      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-300" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{land.title}</h3>
        <p className="text-sm text-gray-600">{land.size} • {land.price}</p>
      </div>
    </Link>
  )
}

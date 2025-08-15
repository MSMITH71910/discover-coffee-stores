import Image from 'next/image';
import Link from 'next/link';

type CardType = {
  name: string;
  imgUrl: string;
  href: string;
  address?: string;
};

export default function Card({ name, imgUrl, href, address }: CardType) {
  return (
    <Link href={href} className="group block">
      <div className="glass rounded-xl p-5 backdrop-blur-3xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gray-900/50">
        {/* Image Section */}
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
          <Image
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            src={imgUrl}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt={`${name} Coffee Shop`}
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8/+ZNPQAIoQM4xp5zkgAAAABJRU5ErkJggg=="
            placeholder="blur"
          />
        </div>
        
        {/* Content Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors">
            {name}
          </h2>
          {address && (
            <p className="text-sm text-gray-400 flex items-start gap-1 leading-relaxed">
              <span className="text-yellow-500 mt-0.5 flex-shrink-0">📍</span>
              <span className="line-clamp-2">{address}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
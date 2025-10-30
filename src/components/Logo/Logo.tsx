"use client";
import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo2.svg" alt="Mythic Battles" width={100} height={100} />
      <span className="text-xl font-bold text-gray-900 dark:text-white">
        Mythic Battles
      </span>
    </Link>
  );
}

export default Logo;

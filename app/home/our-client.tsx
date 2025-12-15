"use client";
import CommonHeading from "./common-heading";
import Image from "next/image";
import avatar from "@/public/avatar.png";
import { Star } from "lucide-react";
import Button from "@/components/common/buttons/black-button";

export default function OurClientSection() {
  return (
    <section className="py-14 lg:py-20 w-full bg-white relative overflow-hidden">
      <div className="xl:w-[1320px] mx-auto px-6 relative">
        <CommonHeading
          className="relative"
          badgeText="Our Clients"
          title="What our Clients are Sharing"
          description="Hear how real individuals and families are improving their daily lives through our AI-powered meal plans and health guidance."
        />

        <div className="relative">
          <div className="masonry">
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Voluptatum hic natus modi eveniet quisquam dolores!”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit.”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae
                autem rerum similique, repellendus velit cumque. Voluptates
                recusandae quos repellendus fugit!”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit,
                facere odit! A ullam cum placeat exercitationem?”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Voluptatum hic natus modi eveniet quisquam dolores!”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit.”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor, sit amet consectetur adipisicing elit. Earum
                voluptate perferendis quam aperiam quidem.”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit,
                facere odit! A ullam cum placeat exercitationem?”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[#E5E5E5] bg-gradient-to-r from-white/0 to-[#F5F5F5]/90 masonry-item">
              <div className="flex items-center gap-1 mb-3 text-sm">
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
                <Star className="size-5 text-black" />
              </div>
              <p className="text-[#737373] mb-6 leading-relaxed line-clamp-4">
                “Lorem ipsum dolor sit amet consectetur adipisicing elit.”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  className="size-12 rounded-full object-cover"
                  width={60}
                  height={60}
                  alt="Avatar"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-black">Sunny Mehra</h4>
                  <p className="text-[#737373] text-sm">
                    Busy Mom & Fitness Enthusiast
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className=" bg-gradient-to-b from-white/50 to-white absolute bottom-0 w-full pt-44 flex items-center justify-center">
            <Button label="Load More Reviews" />
          </div>
        </div>
      </div>
    </section>
  );
}

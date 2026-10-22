import mark from "@/assets/raystate-mark.jpg.asset.json";
import banner from "@/assets/raystate-banner.png.asset.json";
import ubeeIcon from "@/assets/ubee-app-icon.png.asset.json";
import ubee1 from "@/assets/ubee-play-01.jpg.asset.json";
import ubee3 from "@/assets/ubee-play-03.jpg.asset.json";
import ubee4 from "@/assets/ubee-play-04.jpg.asset.json";
import coachinIcon from "@/assets/coachin-icon.png.asset.json";
import coachin1 from "@/assets/checkin_en.webp.asset.json";
import coachin2 from "@/assets/subscribe_en.webp.asset.json";
import coachin3 from "@/assets/pin_en.webp.asset.json";
import stafflyIcon from "@/assets/staffly-icon.png.asset.json";
import staffly1 from "@/assets/en-attendance.webp.asset.json";
import staffly2 from "@/assets/en-profile.webp.asset.json";
import staffly3 from "@/assets/en-checkpoint.webp.asset.json";

export const SITE_ORIGIN = "https://raystate.com";
export const CONTACT_EMAIL = "contact@raystate.com";
export const SOCIAL = {
  facebook: "https://www.facebook.com/raystate.tech/",
  instagram: "https://www.instagram.com/raystate.dev/",
};
export const BRAND = { mark: mark.url, banner: banner.url };
export const OG_IMAGE = `${SITE_ORIGIN}${banner.url}`;

export type ProductId = "ubee" | "coachin" | "staffly";
export type Shot = { src: string; w: number; h: number };

export const PRODUCTS: {
  id: ProductId;
  name: string;
  icon: string;
  site: string;
  play: string;
  accent: string;
  shots: Shot[];
}[] = [
  {
    id: "ubee",
    name: "UBee",
    icon: ubeeIcon.url,
    site: "https://ubee.raystate.com",
    play: "https://play.google.com/store/apps/details?id=com.raystate.ubee",
    accent: "oklch(0.8 0.16 75)",
    shots: [
      { src: ubee1.url, w: 485, h: 1080 },
      { src: ubee3.url, w: 485, h: 1080 },
      { src: ubee4.url, w: 485, h: 1080 },
    ],
  },
  {
    id: "coachin",
    name: "CoachIn",
    icon: coachinIcon.url,
    site: "https://coachin.raystate.com",
    play: "https://play.google.com/store/apps/details?id=com.raystate.coachin",
    accent: "oklch(0.9 0.2 120)",
    shots: [
      { src: coachin1.url, w: 902, h: 1920 },
      { src: coachin2.url, w: 902, h: 1920 },
      { src: coachin3.url, w: 902, h: 1920 },
    ],
  },
  {
    id: "staffly",
    name: "Staffly",
    icon: stafflyIcon.url,
    site: "https://staffly.raystate.com",
    play: "https://play.google.com/store/apps/details?id=com.raystate.staffly",
    accent: "oklch(0.6 0.2 270)",
    shots: [
      { src: staffly1.url, w: 1080, h: 1920 },
      { src: staffly2.url, w: 1080, h: 1920 },
      { src: staffly3.url, w: 1080, h: 1920 },
    ],
  },
];

export const SECTIONS = ["products", "services", "approach", "about", "contact"] as const;
export type SectionId = (typeof SECTIONS)[number];

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "matched" | "resolved" | "closed";
export type ItemCategory =
  | "electronics"
  | "documents"
  | "clothing"
  | "accessories"
  | "keys"
  | "bags"
  | "bottles"
  | "books"
  | "other";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  college_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  tags: string[];
  date_occurred: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  status: ItemStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  score: number;
  status: string;
  created_at: string;
  lost_item?: Item;
  found_item?: Item;
}

export interface Conversation {
  id: string;
  match_id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  other_user?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "new_match" | "new_message" | "match_confirmed";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "documents", label: "Documents" },
  { value: "clothing", label: "Clothing" },
  { value: "accessories", label: "Accessories" },
  { value: "keys", label: "Keys" },
  { value: "bags", label: "Bags" },
  { value: "bottles", label: "Bottles" },
  { value: "books", label: "Books" },
  { value: "other", label: "Other" },
];

export const SUGGESTED_TAGS = [
  // Colors
  "black", "white", "blue", "red", "green", "yellow", "orange", "purple",
  "pink", "brown", "grey", "silver", "gold", "navy", "maroon", "beige",
  "transparent", "multicolor",

  // Electronics
  "iphone", "samsung", "oneplus", "realme", "oppo", "vivo", "xiaomi",
  "laptop", "macbook", "dell", "hp", "lenovo", "asus", "acer",
  "charger", "cable", "adapter", "power bank", "earphones", "earbuds",
  "headphones", "airpods", "speaker", "keyboard", "mouse", "pen drive",
  "usb drive", "hard disk", "tablet", "ipad", "smartwatch", "calculator",

  // Documents & ID
  "id card", "student id", "aadhar", "pan card", "passport", "driving license",
  "admit card", "marksheet", "certificate", "hall ticket", "library card",
  "bus pass", "metro card", "voter id",

  // Clothing
  "jacket", "hoodie", "t-shirt", "shirt", "jeans", "shorts", "skirt",
  "saree", "dupatta", "scarf", "cap", "hat", "shoes", "sneakers",
  "sandals", "slippers", "socks", "gloves", "tie", "belt", "uniform",

  // Accessories & Jewellery
  "watch", "ring", "bracelet", "necklace", "earrings", "chain",
  "sunglasses", "glasses", "spectacles", "wallet", "purse", "handbag",
  "locket", "anklet", "hair clip", "hairband",

  // Bags
  "backpack", "college bag", "laptop bag", "gym bag", "tote bag",
  "sling bag", "trolley", "pouch",

  // Stationery & Books
  "notebook", "textbook", "novel", "pen", "pencil", "geometry box",
  "calculator", "ruler", "eraser", "marker", "highlighter", "folder",
  "file", "diary",

  // Campus & Daily use
  "water bottle", "lunch box", "umbrella", "keys", "key chain",
  "cycle lock", "helmet", "cycle", "lock", "coin purse",

  // Brands
  "apple", "nike", "adidas", "puma", "wildcraft", "american tourister",
  "skybags", "fastrack", "titan", "casio", "boat", "jbl", "sony",
];

export const POPULAR_TAGS = [
  "black", "white", "blue", "iphone", "laptop", "wallet", "id card",
  "keys", "backpack", "charger", "glasses", "watch", "earphones", "notebook",
];

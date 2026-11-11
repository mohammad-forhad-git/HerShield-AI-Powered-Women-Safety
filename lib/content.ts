// Static safety content shared by the public Safety Guidelines page and the student Safety Tips page.

export const SAFETY_SECTIONS: {
  id: string;
  title: string;
  icon: string;
  tips: string[];
}[] = [
  {
    id: "travel",
    title: "Travelling to and from campus",
    icon: "Route",
    tips: [
      "Share your travel plan and expected arrival time with a trusted contact.",
      "Prefer university transport or well-known ride services, especially after dark.",
      "Wait at lit, busy bus stops and avoid isolated short-cuts.",
      "Sit near the driver or other students on public transport.",
      "Keep your phone charged and carry a small power bank.",
    ],
  },
  {
    id: "night",
    title: "Late hours & night safety",
    icon: "Moon",
    tips: [
      "Walk with a friend or use the campus escort service when leaving late.",
      "Stay on main walkways covered by lighting and CCTV.",
      "Keep headphones low or off so you stay aware of your surroundings.",
      "Trust your instincts – if a situation feels wrong, move to a staffed building.",
    ],
  },
  {
    id: "harassment",
    title: "Harassment & stalking",
    icon: "UserX",
    tips: [
      "Move towards people, security staff or a staffed building.",
      "Note descriptions, times and places – screenshots of messages help an investigation.",
      "Report incidents through HerShield even if they seem minor; patterns matter.",
      "You are never to blame. Counselling and the Proctor Office can support you.",
    ],
  },
  {
    id: "medical",
    title: "Medical emergencies",
    icon: "HeartPulse",
    tips: [
      "Keep the person still and safe; do not move someone with a suspected head or neck injury.",
      "Apply firm pressure to bleeding with a clean cloth.",
      "Use the SOS button so campus medical staff get your location immediately.",
      "Know where first-aid kits and the campus medical centre are located.",
    ],
  },
  {
    id: "fire",
    title: "Fire safety",
    icon: "Flame",
    tips: [
      "Raise the alarm and leave by the nearest safe exit – never use lifts.",
      "Stay low under smoke and close doors behind you.",
      "Go to the assembly point and report anyone missing.",
    ],
  },
  {
    id: "digital",
    title: "Digital safety & privacy",
    icon: "Smartphone",
    tips: [
      "Do not post your live location publicly on social media.",
      "Review app permissions – only share location with services you trust.",
      "Keep emergency contacts up to date in HerShield and on your phone lock screen.",
    ],
  },
];

export const EMERGENCY_NUMBERS = [
  { label: "National Emergency (Bangladesh)", number: "999", note: "Police, fire & ambulance" },
  { label: "Women & Child Helpline", number: "109", note: "National helpline" },
  { label: "Campus Security Desk", number: "Ext. 1000 (demo)", note: "Fictional for this prototype" },
  { label: "Campus Medical Centre", number: "Ext. 2000 (demo)", note: "Fictional for this prototype" },
];

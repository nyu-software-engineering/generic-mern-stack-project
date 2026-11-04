import { Link } from "react-router-dom";
import editIcon from "../assets/edit-40px.svg";
import groupIcon from "../assets/group-40px.svg";
import notificationsIcon from "../assets/notifications-40px-white.svg";
import settingsIcon from "../assets/settings-40px.svg";
import logoutIcon from "../assets/logout-40px.svg";
import supportIcon from "../assets/support-40px.svg";

const mockUser = {
  username: "John Doe",
  email: "jd0000@nyu.edu",
  photoUrl: "https://picsum.photos/seed/flier-profile/320/320",
};

const accountItems = [
  { label: "Edit Profile Information", icon: editIcon, to: "/edit-profile" },
  { label: "My Organizations", icon: groupIcon, to: "/organizations" },
  { label: "Notifications", icon: notificationsIcon, to: "/notifications" },
];

const appItems = [
  { label: "Settings", icon: settingsIcon, to: "/settings" },
  { label: "Support", icon: supportIcon, to: "/support" },
  { label: "Log Out", icon: logoutIcon, to: "/" },
];

function MenuRow({ icon, label, to }) {
  return (
    <li>
      <Link to={to} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <img src={icon} alt="" className="size-5 brightness-0" />
        <span className="body-copy">{label}</span>
      </Link>
    </li>
  );
}

function MenuCard({ items }) {
  return (
    <ul className="w-full divide-y divide-(--parchment) overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {items.map((item) => (
        <MenuRow key={item.label} icon={item.icon} label={item.label} to={item.to} />
      ))}
    </ul>
  );
}

export default function Profile() {
  return (
    <section className="flex flex-1 flex-col items-center bg-(--parchment) px-5 pt-8 pb-10 text-(--soft-black)">
      <div className="flex w-full max-w-md flex-col items-center">
        <img
          src={mockUser.photoUrl}
          className="size-36 rounded-2xl bg-(--paper) object-cover shadow-md ring-4 ring-white"
        />
        <h1 className="heading mt-5 text-center">{mockUser.username}</h1>
        <a
          className="body-copy mt-1 text-center underline-offset-4"
        >
          {mockUser.email}
        </a>
        <div className="mt-8 flex w-full flex-col gap-5">
          <MenuCard items={accountItems} />
          <MenuCard items={appItems} />
        </div>
      </div>
    </section>
  );
}

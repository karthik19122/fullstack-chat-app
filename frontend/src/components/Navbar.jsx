import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";  // Import useTranslation

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { t, i18n } = useTranslation();  // useTranslation hook to access translation function and i18n instance

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);  // Change language dynamically
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">{t("welcome")}</h1>  {/* Use translation for welcome */}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => changeLanguage("en")} className="btn btn-sm">English</button>  {/* Language switcher buttons */}
            <button onClick={() => changeLanguage("hi")} className="btn btn-sm">हिन्दी</button>  {/* Language switcher buttons */}

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
               `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t("settings")}</span>  {/* Use translation for settings */}
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">{t("profile")}</span>  {/* Use translation for profile */}
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">{t("logout")}</span>  {/* Use translation for logout */}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

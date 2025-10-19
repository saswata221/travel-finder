import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="py-5 text-center text-lg text-slate-500 space-y-1 bg-slate-50">
      <div className="flex justify-center items-center gap-6 text-blue-500 text-3xl">
        <a
          href="https://github.com/saswata221"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-800 transition-colors text-black"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/saswata-mahato-2218a7250/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 transition-colors"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://x.com/Saswata221"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black transition-colors"
          aria-label="Twitter"
        >
          <FaXTwitter />
        </a>
      </div>

      <p className="text-slate-700 font-semibold">
        Developed by{" "}
        <span className="font-bold text-black font-mono">Saswata Mahato</span>
      </p>

      <p>
        Contact:{" "}
        <a
          href="mailto:saswatamahato652@gmail.com"
          className="text-blue-700 transition-colors text-base"
        >
          saswatamahato652@gmail.com
        </a>
      </p>

      <p className="text-slate-500 text-base">
        © {new Date().getFullYear()} TravelFinder — built with React & Tailwind
      </p>
    </footer>
  );
}

export default Footer;

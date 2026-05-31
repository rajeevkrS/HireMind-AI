const Footer = () => {
  return (
    <footer className="border-t border-white/6 px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-xs">
      <div className="flex items-center gap-3">
        <img
          src="/hiremind-logo.png"
          alt="HIREMind Logo"
          className="w-4 object-contain"
        />

        <img
          src="/hiremind-ai.png"
          alt="HIREMind AI"
          className="h-3 object-contain"
        />
      </div>

      <span className="">
        © {new Date().getFullYear()} HIREMind AI. All rights reserved.
      </span>

      <div className="flex gap-5">
        {["Privacy", "Terms", "Contact"].map((i) => (
          <a key={i} href="#" className="hover:text-white/80 transition-colors">
            {i}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;

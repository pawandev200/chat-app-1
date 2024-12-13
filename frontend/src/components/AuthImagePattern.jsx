// import { Linkedin, Mail } from "lucide-react";
import { FaLinkedin, FaEnvelope, FaGithub } from 'react-icons/fa';
const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary/10 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60 mb-6">{subtitle}</p>


        {/* Footer Section */}
        <p className="text-[16px] text-base-content/60 mb-4">
          © 2024 All rights reserved. Developed by{" "}
          <a
            href="https://linkedin.com/in/pawandev"
            target="_blank"
            rel="noopener noreferrer"
            // className="link link-primary no-underline"
            className="link link-primary"
          >
            @Pawandev Kumar
          </a>
        </p>

        <div className="flex items-center justify-center gap-4">
          {/* LinkedIn Icon */}
          <a href="https://linkedin.com/in/pawandev" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="h-6 w-6 text-base-content/60 hover:text-primary transition-colors" />
          </a>
          {/* Email Icon */}
          <a href="mailto:pawandevlkr736@gmail.com" target="_blank" rel="noopener noreferrer">
            <FaEnvelope className="h-6 w-6 text-base-content/60 hover:text-primary transition-colors" />
          </a>
          {/* GitHub Icon */}
          <a href="https://github.com/pawandev200" target="_blank" rel="noopener noreferrer">
            <FaGithub className="h-6 w-6 text-base-content/60 hover:text-primary transition-colors" />
          </a>
        </div>


        </div>
    </div>
  );
};

export default AuthImagePattern;

import { Github, Code2, Send } from "lucide-react";
export default function Footer() {
  return (
    <footer className="border-t border-gray-700/30 py-6 mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex justify-center space-x-8">
        <a
          href="https://github.com/locker-labs/text-swap"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
        >
          <Github className="h-4 w-4" />
          <span>Github</span>
        </a>
        <a
          href="https://t.me/+stsNEbe16tU5MTY5"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
        >
          <Send className="h-4 w-4" />
          <span>Community</span>
        </a>
      </div>
    </footer>
  );
}

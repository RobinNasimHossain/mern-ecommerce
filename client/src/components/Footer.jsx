export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Shoply. All rights reserved.</p>
        <p>Built with MERN · Tailwind · Stripe</p>
      </div>
    </footer>
  );
}

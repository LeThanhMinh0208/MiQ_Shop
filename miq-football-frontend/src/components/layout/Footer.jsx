import { Link } from 'react-router-dom';

const Footer = () => {
  const sections = [
    {
      title: 'About Us',
      links: ['About a modern collection', 'Support', 'Contact us'],
    },
    {
      title: 'Support',
      links: ['About us', 'Support', 'Recommendations', 'Contact us'],
    },
    {
      title: 'Policies',
      links: ['Access Policies', 'Privacy Policy', 'Terms of Use', 'Terms and conditions'],
    },
  ];

  return (
    <footer className="bg-cream-100 border-t border-cream-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-3">
              Mi<span className="text-primary">Q</span>
            </h3>
            <p className="text-sm text-ink-muted">
              Premium football e-commerce website
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-display text-sm font-bold mb-4 uppercase">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm text-ink-muted hover:text-primary transition">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cream-200 mt-8 pt-6 text-center text-sm text-ink-muted">
          © 2026 MiQ Football Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
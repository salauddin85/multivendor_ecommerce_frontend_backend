// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactCompiler: true,
  
//   images: {
//     // Development mode settings
//     ...(process.env.NODE_ENV === 'development' 
//       ? {
          
//           remotePatterns: [
//             {
//               protocol: 'http',
//               hostname: 'localhost',
//               port: '8000',
//               pathname: '/**', 
//             },
//             {
//               protocol: 'http',
//               hostname: '127.0.0.1',
//               port: '8000',
//               pathname: '/**',
//             },
//           ],
//           unoptimized: true, 
//           dangerouslyAllowSVG: true,
//         }
//       : {
//           // Production: Strict settings
//           remotePatterns: [
//             {
//               protocol: 'https',
//               hostname: 'your-production-domain.com',
//               pathname: '/media/**', 
//             },
//           ],
//           unoptimized: false, 
//           dangerouslyAllowSVG: false, 
//         }
//     ),
//   },
  
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "25mb",
//     },
//   },
// };

// export default nextConfig;



// -------------------------------------------
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Static Export
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  optimizeFonts: false,
};

export default nextConfig;

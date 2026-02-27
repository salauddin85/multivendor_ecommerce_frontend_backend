"use client";
import { motion, Variants } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function UnauthorizedPage() {
  const containerVariants:Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const guardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen h-screen max-h-screen flex items-center justify-center p-4 bg-white  relative overflow-hidden font-primary">
      <motion.div
        className="max-w-2xl w-full text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div  className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/assets/403.svg"
              alt="403 Access Denied - Security Guard"
              width={300}
              height={200}
              className="drop-shadow-lg"
              priority
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Oops! Access Denied
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
            The page might have been removed or you have no permission to view
            it.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg  rounded-lg shadow-lg"
            >
              <Link href="/dashboard" className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { motion } from "motion/react";

const shapes = [
    { size: 240, top: "8%", left: "6%" },
    { size: 180, top: "70%", left: "12%" },
    { size: 320, top: "18%", right: "6%" },
    { size: 200, bottom: "8%", right: "18%" },
    { size: 140, top: "45%", left: "38%" },
    { size: 110, bottom: "35%", left: "55%" },
];

const AuthLayout = () => {
    return (
        <section className="relative min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">

            {/* Figuras */}
            {shapes.map((shape, index) => (
                <motion.div
                    key={index}
                    initial={{ y: 0 }}
                    animate={{ y: [0, -30, 0] }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.6,
                    }}
                    className="absolute rounded-full bg-slate-300 blur-xs z-0"
                    style={{
                        width: shape.size,
                        height: shape.size,
                        ...shape,
                    }}
                />
            ))}

            {/* Card */}
            {/* <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            > */}
                <Outlet />
            {/* </motion.div> */}
        </section>
    );
};

export default AuthLayout;

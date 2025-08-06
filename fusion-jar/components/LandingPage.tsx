"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export function LandingPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Handle email submission - you can add API call here
    console.log("Email submitted:", email);
    toast.success("Thanks for joining our waitlist! We'll be in touch soon.");
    setEmail(""); // Clear the email field
  };

  return (
    <div className="bg-[var(--background-color)] text-[var(--text-primary)]">
      <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-7xl flex-1">
              <header className="flex justify-between items-center py-6 px-4">
                <div className="flex items-center space-x-3">
                  <img
                    src="/fusionjarlogo.svg"
                    alt="Fusion Jar Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div className="text-2xl font-bold">Fusion Jar</div>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                  <a
                    className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="#how-it-works"
                  >
                    How It Works
                  </a>
                  <a
                    className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="#why-fusion-jar"
                  >
                    Why Us?
                  </a>
                  {/* <a
                    className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="#social-proof"
                  >
                    Community
                  </a> */}
                </nav>
                <button
                  onClick={login}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[var(--primary-color)] text-white text-sm font-bold leading-normal tracking-wide hover-glow"
                >
                  <span className="truncate">Connect Wallet</span>
                </button>
              </header>

              <main>
                {/* Hero Section */}
                <section className="grid lg:grid-cols-2 items-center gap-8 py-16 lg:py-24">
                  <div className="text-center lg:text-left">
                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                      Invest{" "}
                      <span className="text-[var(--primary-color)]">$1</span>{" "}
                      like a Chad.
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto lg:mx-0">
                      Gasless. Cross-chain. Gamified. The future of
                      micro-investing is here.
                    </p>
                    <div className="mt-8 flex justify-center lg:justify-start">
                      <button
                        onClick={login}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-[var(--primary-color)] text-white text-lg font-bold leading-normal tracking-wide hover-glow transform hover:scale-105 transition-transform"
                      >
                        <span className="truncate">Start Investing Now</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative hidden lg:flex justify-center items-center h-96">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 rounded-full bg-[var(--primary-color)]/20 animate-glow"></div>
                      <div className="absolute inset-5 rounded-full bg-[var(--card-background)] border-4 border-[var(--primary-color)] flex items-center justify-center animate-float">
                        <svg
                          className="w-20 h-20 text-[var(--primary-color)]"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M208,80H176V56a48.05,48.05,0,0,0-48-48,48.05,48.05,0,0,0-48,48V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208Z"></path>
                        </svg>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--highlight-color)] rounded-full animate-orbit-1"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--success-color)] rounded-full animate-orbit-2"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-orbit-3"></div>
                    </div>
                  </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 px-4" id="how-it-works">
                  <h2 className="text-4xl font-bold text-center mb-12">
                    How It Works
                  </h2>
                  <div className="relative max-w-4xl mx-auto">
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[var(--border-color)] -translate-x-1/2"></div>
                    <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                      {/* Step 1 */}
                      <div className="flex items-center gap-6 md:justify-end">
                        <div className="text-right">
                          <h3 className="text-2xl font-bold">Connect Wallet</h3>
                          <p className="text-[var(--text-secondary)] mt-2">
                            Securely connect your wallet in seconds.
                          </p>
                        </div>
                        <div className="relative flex-shrink-0">
                          <div className="absolute w-4 h-4 rounded-full bg-[var(--primary-color)] -right-9 top-1/2 -translate-y-1/2 border-4 border-[var(--background-color)]"></div>
                          <div className="p-3 rounded-full bg-[var(--card-background)] border border-[var(--border-color)]">
                            <svg
                              className="text-[var(--primary-color)]"
                              fill="currentColor"
                              height="32"
                              viewBox="0 0 256 256"
                              width="32"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M216,72H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,64V192a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H56a8,8,0,0,1-8-8V86.63A23.84,23.84,0,0,0,56,88H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,140Z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div></div>

                      {/* Step 2 */}
                      <div></div>
                      <div className="flex items-center gap-6">
                        <div className="relative flex-shrink-0">
                          <div className="absolute w-4 h-4 rounded-full bg-[var(--primary-color)] -left-9 top-1/2 -translate-y-1/2 border-4 border-[var(--background-color)]"></div>
                          <div className="p-3 rounded-full bg-[var(--card-background)] border border-[var(--border-color)]">
                            <svg
                              className="text-[var(--primary-color)]"
                              fill="currentColor"
                              height="32px"
                              viewBox="0 0 256 256"
                              width="32px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            Pick/Create Jar
                          </h3>
                          <p className="text-[var(--text-secondary)] mt-2">
                            Choose an existing investment jar or create your
                            own.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-center gap-6 md:justify-end">
                        <div className="text-right">
                          <h3 className="text-2xl font-bold">Invest</h3>
                          <p className="text-[var(--text-secondary)] mt-2">
                            Start with as little as $1. No gas fees, ever.
                          </p>
                        </div>
                        <div className="relative flex-shrink-0">
                          <div className="absolute w-4 h-4 rounded-full bg-[var(--primary-color)] -right-9 top-1/2 -translate-y-1/2 border-4 border-[var(--background-color)]"></div>
                          <div className="p-3 rounded-full bg-[var(--card-background)] border border-[var(--border-color)]">
                            <svg
                              className="text-[var(--primary-color)]"
                              fill="currentColor"
                              height="32"
                              viewBox="0 0 256 256"
                              width="32"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM240,56H16a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V64A8,8,0,0,0,240,56ZM193.65,184H62.35A56.78,56.78,0,0,0,24,145.65v-35.3A56.78,56.78,0,0,0,62.35,72h131.3A56.78,56.78,0,0,0,232,110.35v35.3A56.78,56.78,0,0,0,193.65,184ZM232,93.37A40.81,40.81,0,0,1,210.63,72H232ZM45.37,72A40.81,40.81,0,0,1,24,93.37V72ZM24,162.63A40.81,40.81,0,0,1,45.37,184H24ZM210.63,184A40.81,40.81,0,0,1,232,162.63V184Z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div></div>

                      {/* Step 4 */}
                      <div></div>
                      <div className="flex items-center gap-6">
                        <div className="relative flex-shrink-0">
                          <div className="absolute w-4 h-4 rounded-full bg-[var(--primary-color)] -left-9 top-1/2 -translate-y-1/2 border-4 border-[var(--background-color)]"></div>
                          <div className="p-3 rounded-full bg-[var(--card-background)] border border-[var(--border-color)]">
                            <svg
                              className="text-[var(--primary-color)]"
                              fill="currentColor"
                              height="32"
                              viewBox="0 0 256 256"
                              width="32"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            Earn XP/Streaks
                          </h3>
                          <p className="text-[var(--text-secondary)] mt-2">
                            Level up, earn badges, and maintain streaks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Why Fusion Jar Section */}
                <section className="py-16 px-4" id="why-fusion-jar">
                  <h2 className="text-4xl font-bold text-center mb-12">
                    Why Fusion Jar?
                  </h2>
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="bg-[var(--card-background)] p-8 rounded-2xl border border-[var(--border-color)]">
                      <h3 className="text-2xl font-bold mb-4 text-[var(--text-secondary)]">
                        Investing without Fusion Jar
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-red-500 mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-122.34a8,8,0,0,1,0,11.32L141.66,128l24,24a8,8,0,0,1-11.32,11.32L128,139.31l-24.34,24.35a8,8,0,0,1-11.32-11.32L116.69,128l-24.35-24.34a8,8,0,0,1,11.32-11.32L128,116.69l24.34-24.35A8,8,0,0,1,165.66,93.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              High Gas Fees:
                            </strong>{" "}
                            Small investments become impractical due to
                            transaction costs.
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-red-500 mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-122.34a8,8,0,0,1,0,11.32L141.66,128l24,24a8,8,0,0,1-11.32,11.32L128,139.31l-24.34,24.35a8,8,0,0,1-11.32-11.32L116.69,128l-24.35-24.34a8,8,0,0,1,11.32-11.32L128,116.69l24.34-24.35A8,8,0,0,1,165.66,93.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              Complex Process:
                            </strong>{" "}
                            Navigating multiple platforms for cross-chain swaps
                            is confusing.
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-red-500 mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm37.66-122.34a8,8,0,0,1,0,11.32L141.66,128l24,24a8,8,0,0,1-11.32,11.32L128,139.31l-24.34,24.35a8,8,0,0,1-11.32-11.32L116.69,128l-24.35-24.34a8,8,0,0,1,11.32-11.32L128,116.69l24.34-24.35A8,8,0,0,1,165.66,93.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              Lack of Motivation:
                            </strong>{" "}
                            It's easy to lose track and discipline without
                            engaging feedback.
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-[var(--primary-color)]/10 p-8 rounded-2xl border border-[var(--primary-color)]">
                      <h3 className="text-2xl font-bold mb-4 text-[var(--success-color)]">
                        Investing with Fusion Jar
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-[var(--success-color)] mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-124.34a8,8,0,0,1-11.32,11.32L112,156.69l-17.66-17.67a8,8,0,0,1,11.32-11.32L112,134.05l50.34-50.34A8,8,0,0,1,173.66,91.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              Gasless Transactions:
                            </strong>{" "}
                            We cover the gas fees. Your $1 investment is a full
                            $1.
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-[var(--success-color)] mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-124.34a8,8,0,0,1-11.32,11.32L112,156.69l-17.66-17.67a8,8,0,0,1,11.32-11.32L112,134.05l50.34-50.34A8,8,0,0,1,173.66,91.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              Seamless Cross-Chain:
                            </strong>{" "}
                            Invest across any chain with a single click. We
                            handle the complexity.
                          </span>
                        </li>
                        <li className="flex items-start gap-4">
                          <svg
                            className="text-[var(--success-color)] mt-1 flex-shrink-0"
                            fill="currentColor"
                            height="24"
                            viewBox="0 0 256 256"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-124.34a8,8,0,0,1-11.32,11.32L112,156.69l-17.66-17.67a8,8,0,0,1,11.32-11.32L112,134.05l50.34-50.34A8,8,0,0,1,173.66,91.66Z"></path>
                          </svg>
                          <span>
                            <strong className="text-[var(--text-primary)]">
                              Gamified Experience:
                            </strong>{" "}
                            Earn XP, streaks, and badges. Compete with friends
                            and stay motivated.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Social Proof Section */}
                {/* <section className="py-16 px-4" id="social-proof">
                  <h2 className="text-4xl font-bold text-center mb-12">
                    Loved by the Community
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <div className="bg-[var(--card-background)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          alt="Ethan Carter"
                          className="w-12 h-12 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9cZcIvJ4-ROcIZT6SuJAjnaOLVrWHEssT5MerqqUp9cl76eWqy3CTJQ6aPGc-mDJFCrXxpluzcBcEagD4GCGlOq86typX_EUWp6C09GJQbQoL4mGvR_yQsfjcCFxcwEkKGQDkh56BlsIQikTG3F2AspWz5BOh0t5ff7jON85miJIeOrAMQtpIj3swNrbv8kiKJgXd6GvrtD01aAIFM-KkTla2LMDsQHWbfVopi8GF3Eq8n4dNKcbl6iTpQ1bqZKV3oT-jXrED2A"
                        />
                        <div>
                          <p className="font-bold">Ethan Carter</p>
                          <div className="flex gap-0.5 text-[var(--highlight-color)]">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                fill="currentColor"
                                height="16"
                                viewBox="0 0 256 256"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] flex-grow">
                        "Fusion Jar has completely changed how I approach
                        investing. The gamified aspect keeps me motivated, and
                        the gasless transactions are a game-changer."
                      </p>
                    </div>

                    <div className="bg-[var(--card-background)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          alt="Olivia Bennett"
                          className="w-12 h-12 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBnJd3Ya-j0cjxZvN9qaCx7L-BsKzYVXQdJcjBRzbAHYa7Biq78lM6DomSpGhBCHFfV8GybOL5YRuhiM8xBp65VeV50BAOmgy01vOSSuxrrkvmzBNJjFR8zp1YYYqie41rG8swJd4nKQI5K2a0SIKFkpAATUS9A8yKmdMVvOHitiX6SDvP-0V8z0JCUUZFBvd-KPhF9DPk0yotQkaQnvssPQtKPtDJ_HaYL_4bYzvvYrvGWT4AS0J2QxXd7lXPLyD4Tr-tl070Vg"
                        />
                        <div>
                          <p className="font-bold">Olivia Bennett</p>
                          <div className="flex gap-0.5 text-[var(--highlight-color)]">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                fill="currentColor"
                                height="16"
                                viewBox="0 0 256 256"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] flex-grow">
                        "I love the flexibility of investing small amounts
                        across different chains. It's a great way to diversify
                        my portfolio without breaking the bank."
                      </p>
                    </div>

                    <div className="bg-[var(--card-background)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col md:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          alt="Noah Thompson"
                          className="w-12 h-12 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhwtJNWPzKX85f1rfey7YaB7JjRtM-60kpMMleWAu9VadLYDeiY7oXCSh1iiutnYi7C6Sfc7i5DEVnL2caMhrFxWr__vlsvGYH_jv7_ynijDAVMFapfyqh9g5yPOS368RKMCTp2Hgy78Wgf26ClkAY7rl5u9brDCYp8CfBB5vMPd-BGp0f9ynUlM9QQmMblZfo5g42qWa7s25XiseOE13CVIisrcbOnM6CzjYuth_IkoQiuafzcPg-op2djmNr5-YJBMj-pbuZlg"
                        />
                        <div>
                          <p className="font-bold">Noah Thompson</p>
                          <div className="flex gap-0.5 text-[var(--highlight-color)]">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                fill="currentColor"
                                height="16"
                                viewBox="0 0 256 256"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-[var(--text-secondary)] flex-grow">
                        "The community is super supportive, and the daily quests
                        make saving fun. I've already seen significant growth in
                        my investments."
                      </p>
                    </div>
                  </div>
                </section> */}

                {/* Email Signup Section */}
                <section className="py-16 px-4">
                  <div className="bg-[var(--card-background)] rounded-2xl p-8 md:p-16 text-center border border-[var(--border-color)] max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4">
                      Get Early Access
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                      Be the first to know when Fusion Jar launches. Sign up for
                      our waitlist and receive exclusive updates and rewards.
                    </p>
                    <form
                      className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                      onSubmit={handleSubmit}
                    >
                      <input
                        className="form-input flex-grow w-full rounded-full h-14 px-6 bg-[var(--background-color)] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <button
                        className="flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-[var(--primary-color)] text-white text-lg font-bold leading-normal tracking-wide hover-glow transform hover:scale-105 transition-transform"
                        type="submit"
                      >
                        Join Waitlist
                      </button>
                    </form>
                  </div>
                </section>
              </main>

              {/* Footer */}
              <footer className="text-center py-10 px-4">
                <div className="flex justify-center gap-6 mb-6">
                    {/*<a
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="#"
                  >
                   <svg
                      fill="currentColor"
                      height="24"
                      viewBox="0 0 256 256"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                    </svg>

                  </a>*/}
                  {/* <a
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="#"
                  >
                    <svg
                      fill="currentColor"
                      height="24"
                      viewBox="0 0 256 256"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M104,140a12,12,0,1,1-12-12A12,12,0,0,1,104,140Zm60-12a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm74.45,64.9-67,29.71a16.17,16.17,0,0,1-21.71-9.1l-8.11-22q-6.72.45-13.63.46t-13.63-.46l-8.11,22a16.18,16.18,0,0,1-21.71,9.1l-67-29.71a15.93,15.93,0,0,1-9.06-18.51L38,58A16.07,16.07,0,0,1,51,46.14l36.06-5.93a16.22,16.22,0,0,1,18.26,11.88l3.26,12.84Q118.11,64,128,64t19.4.93l3.26-12.84a16.21,16.21,0,0,1,18.26-11.88L205,46.14A16.07,16.07,0,0,1,218,58l29.53,116.38A15.93,15.93,0,0,1,238.45,192.9ZM232,178.28,202.47,62s0,0-.08,0L166.33,56a.17.17,0,0,0-.17,0l-2.83,11.14c5,.94,10,2.06,14.83,3.42A8,8,0,0,1,176,86.31a8.09,8.09,0,0,1-2.16-.3A172.25,172.25,0,0,0,128,80a172.25,172.25,0,0,0-45.84,6,8,8,0,1,1-4.32-15.4c4.82-1.36,9.78-2.48,14.82-3.42L89.83,56s0,0-.12,0h0L53.61,61.93a.17.17,0,0,0-.09,0L24,178.33,91,208a.23.23,0,0,0,.22,0L98,189.72a173.2,173.2,0,0,1-20.14-4.32A8,8,0,0,1,82.16,170,171.85,171.85,0,0,0,128,176a171.85,171.85,0,0,0,45.84-6,8,8,0,0,1,4.32,15.41A173.2,173.2,0,0,1,158,189.72L164.75,208a.22.22,0,0,0,.21,0Z"></path>
                    </svg>
                  </a> */}
                  <a
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    href="https://github.com/yourdevkalki/FusionJar.git"
                  >
                    <svg
                      fill="currentColor"
                      height="24"
                      viewBox="0 0 256 256"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path>
                    </svg>
                  </a>
                </div>
                <p className="text-[var(--text-secondary)] text-sm">
                  © 2025 Fusion Jar. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

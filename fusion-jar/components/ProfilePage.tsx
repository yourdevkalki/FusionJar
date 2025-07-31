"use client";


export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-[var(--secondary-500)] to-transparent p-6 sm:p-8">
            <div
              className="size-32 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-[var(--primary-500)]"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD-yLm2IrJbOC870m61Xv4pvuvy9g3ufebElWziDZLNRN3t9ipee87vBC-CDtczH9TjLCNMQGn5z6YtVjfLs35XhYsVrGchgw05KpSbjQGLWJpqT2vySTjGIiMkRrOXA_LMA07-vmWy-u3_L64Xco706UKCzgsha475vpQduD8kGfiQ0QgmM3KVbDbhqhDPLLLtIKxwW9UPqOtm6Y1ZW0xPW7G_GeOpM7QyaBtY-mHqcZKZpFoEj268CsQHgw1O9Gmqs-q5XNYmBw")',
              }}
            ></div>
            <div className="text-center">
              <h2 className="text-3xl font-bold">Sophia Carter</h2>
              <p className="text-[var(--secondary-400)]">@SophiaC</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
                <p className="text-3xl font-bold">Level 5</p>
                <p className="text-sm text-[var(--secondary-400)]">Level</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
                <p className="text-3xl font-bold">1200 XP</p>
                <p className="text-sm text-[var(--secondary-400)]">Total XP</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
                <p className="text-3xl font-bold">3 Badges</p>
                <p className="text-sm text-[var(--secondary-400)]">
                  Achievements
                </p>
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <p>XP Progress</p>
                <p>1200 / 2000 XP</p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--secondary-500)]">
                <div
                  className="h-full rounded-full bg-[var(--primary-500)]"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
            <div className="flex w-full items-center justify-between rounded-xl border border-[var(--secondary-500)] bg-[var(--secondary-600)] p-4">
              <p className="font-medium">Current Streak</p>
              <p className="flex items-center gap-1 text-lg font-bold text-orange-400">
                7<span className="text-2xl">🔥</span>
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-2xl font-bold">Achievements/Badges</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB30uZiYh5atH9futQDeZw6zsvklNJtuZU-JK20jN7ksHaaFNqieFtYRyNd3wCzeOLkHvDrJ1AfF16sDZ5B6pVinqtNZ730Gq7MWCpvMVWl2ZkPcxttTv5Dica0b8sRY6NuCgQZbzbM4qWsMnEsqFlrZ7u1B0xw3mD_jrPVJaIO-wQXvKzXj50BJhw69nOFUvWbDBAi8Jlv7uYV1q1oqWZ8jVuB8UBmKuTvoX_ZQrabfB3-QIePnuFH-frlCIxONaDPCFtIw_a0Ig")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Pioneer</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    First Investment
                  </p>
                </div>
              </div>
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV4RZStkdD-P5TsIYQHzuoxGnquloim5bhbGmFbYVhTGo5pxZlLx14bNiiktx5GmGgyjGPrtQdqHLfrCMYyk0n2GeuCykUNop-PSO3JJg-BvvCCNxaftt-gEai0lRXoLyNzbdrYv_5ckGcpRu2976ZFzHdzeVuSXaBOVt5gpn2152l489kTdcO_CMNkUU8bcDflz-9F8qTcdzw2XZZAIFL-LxuF8VdEpVL1Px8ujVpe3HeLZlYhi3U2Uoz6IW--gdUHBw_WTMkkA")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Chain Hopper</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    First Cross-Chain
                  </p>
                </div>
              </div>
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBChSi2Ba9L7RWKA4i5NHTb3rbK16WM-bzycRW2bculrQwp0fMeC-Ms8HeRWnnjQ6nZwtB4YqMC2AXBqAUL44AH8RhjgTHvmYIAmW3m6C0HPRoyfIH5bN0AcE76h2NV4PxgreGLZQXY3Vgd8Y2JX0qZasKuR4zBIISeLnU2L2qXROP3ZmWEDkEmVnqk5gVVTfDptdVZIuqU2E-xWBnjeF3CZkpE_tJOoUyUBg024n-UEED6Fq_aeZwNoGWkfYkF6ZVs4rgO3HY2zg")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Streak King</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    7 Day Streak
                  </p>
                </div>
              </div>
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat opacity-50 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB7_8tAPxcgMrUV0UfMW-v7hk80dcb2ArHQe8O8LDKWqpnAMw9peFC82eAVN6NOBTw0jldXV5eNgjzj7Mc6PtmhV1qnrHE1BUQ_-JsjcktN9-Hhj1hM8QA-2EU2E-lpvX05RssOG8dgigdPKIUUeMr7BN_zWaJk2hFTBi4mqhlFdxXaDo9zWw8MQUgKYWdnuu23_l0VI7jqQj1AGJ5eyHkaShiRjgr5x_LBgKV6vXuChalGwX066Gf1pKmMmzRepBF9vC7t_0-bmQ")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Investor Pro</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    100 Investments
                  </p>
                </div>
              </div>
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat opacity-50 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBoPn9aU63-GSJi_Zc5AhoKABGwjVGhMl_BzBkFDCKEHiUWBmrMKw19hHErzxfYpk_jCLeCGqDTI3giKPbvHagXjTZThha9qvVuxeaMxrCo2PpDcQf5OQEN10giWUREMUXwoo9NRW4-m_4ZjoHPu163YBqowlFr07psjaVQFuSc0AgRuapfv9Tsn5tWHxYtgg2xMCyOg4cZXBeh5AeS8g0lMwZ6D3GpKKaBlBIuA2dtUgSJOC6ScOPnvOpJ7CkpYq0XrawEW1lrWA")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Mastermind</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    Level 10
                  </p>
                </div>
              </div>
              <div className="group relative aspect-square">
                <div
                  className="h-full w-full rounded-2xl bg-cover bg-center bg-no-repeat opacity-50 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAN7vmwJXZw7mB1GJbr8DZkcC5BMRhChd_ZfvG1YCB3IxCC5B1gv9L-4S0AEYFc_OtLw2EYE-SQtE9Qy84MrgWGLbXkgVDTt5q2LezZTiZhyADbWpwzX5CgZtkus7KMO1saJxJAJmPUStQUwUDAMZ6OBsrnW3XL27hsO8SNh5h5EEhDb8_DPsxa9r3y9F_WljqVaCUPWx58l9zOYJpa6SITpzCdpJAY7BqTMs5KN6ORQTMs6luHE9ytjVp_IbWqCEwwqZOgZqIM1g")',
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 p-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-bold">Globetrotter</p>
                  <p className="text-xs text-[var(--secondary-400)]">
                    Invest in 5 chains
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-2xl font-bold">Missions/Quests</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--secondary-500)] bg-gradient-to-r from-transparent to-[var(--secondary-500)]/30 p-4">
                <div>
                  <p className="font-semibold">Daily: 3 Micro-investments</p>
                  <p className="text-sm text-[var(--secondary-400)]">
                    Complete 3 micro-investments.
                  </p>
                </div>
                <button className="shrink-0 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-bold text-[var(--white)] transition-colors hover:bg-[var(--primary-600)]">
                  Claim 50 XP
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--secondary-500)] bg-gradient-to-r from-transparent to-[var(--secondary-500)]/30 p-4">
                <div>
                  <p className="font-semibold">Daily: Cross-Chain Investment</p>
                  <p className="text-sm text-[var(--secondary-400)]">
                    Invest in a cross-chain asset.
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-full bg-[var(--secondary-500)] px-4 py-2 text-sm font-bold text-[var(--secondary-400)]"
                  disabled
                >
                  Claimed
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--secondary-500)] bg-gradient-to-r from-transparent to-[var(--secondary-500)]/30 p-4">
                <div>
                  <p className="font-semibold">Weekly: Mission Marathon</p>
                  <p className="text-sm text-[var(--secondary-400)]">
                    Complete all daily missions for a week.
                  </p>
                </div>
                <button className="shrink-0 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-bold text-[var(--white)] transition-colors hover:bg-[var(--primary-600)]">
                  Claim 200 XP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

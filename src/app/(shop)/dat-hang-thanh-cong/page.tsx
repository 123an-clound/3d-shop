import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/data";
import { ShieldIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Đặt hàng thành công", robots: { index: false } };

export default function OrderSuccessPage(props: PageProps<"/dat-hang-thanh-cong">) {
  return (
    <div className="container-x max-w-2xl py-16">
      <Suspense fallback={<div className="card h-72 animate-pulse" aria-busy="true" />}>
        <SuccessContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function SuccessContent({ searchParams }: { searchParams: PageProps<"/dat-hang-thanh-cong">["searchParams"] }) {
  const [sp, { bank, contact }] = await Promise.all([searchParams, getSettings()]);
  const raw = Array.isArray(sp.ma) ? sp.ma[0] : sp.ma;
  // Order codes look like 3D251008ABC123; anything else is ignored rather than echoed.
  const code = raw && /^3D\d{6}[A-F0-9]{6}$/.test(raw) ? raw : null;
  const isBank = sp.tt === "bank_transfer";

  return (
    <div className="card animate-fade-up p-6 text-center sm:p-10">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success"><ShieldIcon width={32} height={32} /></span>
      <h1 className="mt-5 font-display text-3xl font-bold">Đặt hàng thành công!</h1>
      {code && (
        <p className="mt-3 text-muted">
          Mã đơn hàng: <strong className="font-display text-lg text-accent">{code}</strong>
        </p>
      )}
      <p className="mt-3 text-sm text-muted">
        Chúng tôi sẽ gọi điện xác nhận trong thời gian sớm nhất{contact.hours ? ` (${contact.hours})` : ""}.
      </p>

      {isBank && bank.account_number && (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-left text-sm">
          <h2 className="font-semibold text-accent">Thông tin chuyển khoản</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="text-muted">Ngân hàng</dt><dd>{bank.bank_name}</dd>
            <dt className="text-muted">Số tài khoản</dt><dd className="font-semibold">{bank.account_number}</dd>
            <dt className="text-muted">Chủ tài khoản</dt><dd>{bank.account_name}</dd>
            {code && (<><dt className="text-muted">Nội dung</dt><dd className="font-semibold">{code}</dd></>)}
          </dl>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/san-pham" className="btn-primary">Tiếp tục mua sắm</Link>
        <Link href="/" className="btn-ghost">Về trang chủ</Link>
      </div>
    </div>
  );
}

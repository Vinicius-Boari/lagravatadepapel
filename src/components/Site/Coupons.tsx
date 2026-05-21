import { Ticket } from "lucide-react";
import { memo } from "react";
import { EditableElement } from "@/components/admin/EditableElement";

interface CouponsProps {
  coupons: any;
}

export const Coupons = memo(({ coupons }: CouponsProps) => {
  return (
    <section className="coupons-section" id="cupons">
      <div className="section-header reveal text-center">
        <EditableElement section="coupons" field="heading" type="text" label="Título Cupons">
          <h2 className="mx-auto">{coupons?.heading || "Cupons"} 
            <EditableElement section="coupons" field="heading_em" type="text" label="Destaque Cupons">
              <em>{coupons?.heading_em || "Especiais"}</em>
            </EditableElement>
          </h2>
        </EditableElement>
      </div>
      <div className="coupons-grid max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
        {(coupons?.items || []).map((coupon: any, i: number) => (
          <div key={i} className="coupon-card reveal tilt-3d scroll-3d">
            <div className="coupon-content">
              <div className="coupon-header">
                <Ticket className="w-8 h-8 text-red-600 mb-2" />
                <EditableElement section="coupons" field={`items[${i}].discount`} type="text" label="Desconto">
                  <span className="coupon-discount">{coupon.discount}</span>
                </EditableElement>
              </div>
              <EditableElement section="coupons" field={`items[${i}].title`} type="text" label="Título Cupom">
                <h3 className="coupon-title">{coupon.title}</h3>
              </EditableElement>
              <EditableElement section="coupons" field={`items[${i}].description`} type="textarea" label="Descrição Cupom">
                <p className="coupon-description">{coupon.description}</p>
              </EditableElement>
              <div className="coupon-code-wrapper">
                <EditableElement section="coupons" field={`items[${i}].code`} type="text" label="Código Cupom">
                  <span className="coupon-code">{coupon.code}</span>
                </EditableElement>
                <EditableElement section="coupons" field={`items[${i}].link`} type="link" label="Link Cupom">
                  <a href={coupon.link} className="coupon-btn" onClick={(e) => e.preventDefault()}>
                    RESGATAR
                  </a>
                </EditableElement>
              </div>
            </div>
            <div className="coupon-border-left"></div>
            <div className="coupon-border-right"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12 reveal">
        <a href="/questionarioevento" className="btn-outline">
          <span>QUERO MEU CUPOM</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
});

Coupons.displayName = "Coupons";

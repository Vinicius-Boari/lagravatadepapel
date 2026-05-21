import { Ticket } from "lucide-react";
import { memo } from "react";


interface CouponsProps {
  coupons: any;
}

export const Coupons = memo(({ coupons }: CouponsProps) => {
  return (
    <section className="coupons-section" id="cupons">
      <div className="section-header reveal text-center">
        
          <h2 className="mx-auto">{coupons?.heading || "Cupons"} 
            
              <em>{coupons?.heading_em || "Especiais"}</em>
            
          </h2>
        
      </div>
      <div className="coupons-grid max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
        {(coupons?.items || []).map((coupon: any, i: number) => (
          <div key={i} className="coupon-card reveal tilt-3d scroll-3d">
            <div className="coupon-content">
              <div className="coupon-header">
                <Ticket className="w-8 h-8 text-red-600 mb-2" />
                
                  <span className="coupon-discount">{coupon.discount}</span>
                
              </div>
              
                <h3 className="coupon-title">{coupon.title}</h3>
              
              
                <p className="coupon-description">{coupon.description}</p>
              
              <div className="coupon-code-wrapper">
                
                  <span className="coupon-code">{coupon.code}</span>
                
                
                  <a href={coupon.link} className="coupon-btn" onClick={(e) => e.preventDefault()}>
                    RESGATAR
                  </a>
                
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

/** Proteína, carboidrato e gordura do dia, em gramas. */
export function MacroSummary({ proteinG, carbsG, fatG }: { proteinG: number; carbsG: number; fatG: number }) {
  return (
    <div className="mt-1 flex animate-entra gap-[18px] border-t border-tinta pt-3.5" style={{ animationDelay: "840ms" }}>
      <span className="text-[13px] font-semibold">
        {proteinG} g <span className="font-medium text-fumo">proteína</span>
      </span>
      <span className="text-[13px] font-semibold">
        {carbsG} g <span className="font-medium text-fumo">carboidrato</span>
      </span>
      <span className="text-[13px] font-semibold">
        {fatG} g <span className="font-medium text-fumo">gordura</span>
      </span>
    </div>
  );
}

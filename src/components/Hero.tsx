type HeroProps = {
  title: string;
  subtitle: string;
  backgroundUrl?: string;
};

export default function Hero({ title, subtitle, backgroundUrl }: HeroProps) {
  return (
    <section
      className="py-24 text-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
      }}
    >
      <div className="max-w-3xl mx-auto bg-neutral p-6 rounded-lg shadow-md backdrop-blur-sm">
        <h2 className="text-4xl font-bold text-[--color-primary] mb-4">
          {title}
        </h2>
        <p className="text-lg text-[--color-secondary]">{subtitle}</p>
      </div>
    </section>
  );
}

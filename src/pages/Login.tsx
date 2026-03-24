import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    url: 'https://www.creativeshoot.net/wp-content/uploads/2025/11/Iklan-1.jpg',
    title: 'Tema Rustic Romance',
    desc: 'Nuansa romantis dengan sentuhan alam',
  },
  {
    url: 'https://www.creativeshoot.net/wp-content/uploads/2025/11/31.jpg',
    title: 'Tema Jungle',
    desc: 'Petualangan liar penuh warna',
  },
  {
    url: 'https://www.creativeshoot.net/wp-content/uploads/2025/11/Iklan-1-1.jpg',
    title: 'Tema Pantai',
    desc: 'Keindahan pantai dalam setiap frame',
  },
  {
    url: 'https://www.creativeshoot.net/wp-content/uploads/2025/11/Upload-2.jpg',
    title: 'Tema Street',
    desc: 'Gaya urban yang penuh karakter',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login gagal',
        description: error.message,
      });
    } else {
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang kembali!',
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Slideshow */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-[hsl(215,28%,8%)]">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <img
            key={index}
            src={slide.url}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: currentSlide === index ? 1 : 0 }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(215,28%,12%)]/70 via-transparent to-[hsl(215,28%,12%)]/80" />

        {/* Top - Logo */}
        <div className="absolute top-0 left-0 right-0 z-20 p-10">
          <div className="flex items-center gap-3">
            <div className="bg-[hsl(173,58%,39%)] p-2.5 rounded-xl">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">
              CREATIVE SHOOT
            </span>
          </div>
        </div>

        {/* Bottom - Slide Info + Nav */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-10">
          <div className="flex items-end justify-between">
            {/* Slide text */}
            <div>
              <p className="text-[hsl(173,58%,45%)] text-sm font-semibold uppercase tracking-widest mb-2">
                Sampel Pemotretan
              </p>
              <h2 className="text-white font-display text-3xl xl:text-4xl font-bold mb-2 transition-all duration-500">
                {heroSlides[currentSlide].title}
              </h2>
              <p className="text-white/60 text-base">
                {heroSlides[currentSlide].desc}
              </p>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 mt-6">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  currentSlide === index
                    ? 'w-8 bg-[hsl(173,58%,45%)]'
                    : 'w-4 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-[hsl(215,28%,12%)] p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-[hsl(173,58%,39%)] p-2.5 rounded-xl">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">
              CREATIVE SHOOT
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-white font-display text-2xl font-bold mb-2">
              Masuk ke CRM
            </h2>
            <p className="text-[hsl(215,15%,55%)] text-sm">
              Kelola pelanggan, order, dan invoice Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(210,20%,80%)] text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-[hsl(215,25%,18%)] border-[hsl(215,25%,22%)] text-white placeholder:text-[hsl(215,15%,40%)] focus-visible:ring-[hsl(173,58%,45%)] focus-visible:border-[hsl(173,58%,45%)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(210,20%,80%)] text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-[hsl(215,25%,18%)] border-[hsl(215,25%,22%)] text-white placeholder:text-[hsl(215,15%,40%)] focus-visible:ring-[hsl(173,58%,45%)] focus-visible:border-[hsl(173,58%,45%)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,15%,45%)] hover:text-[hsl(173,58%,45%)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[hsl(173,58%,39%)] hover:bg-[hsl(173,58%,34%)] text-white font-semibold text-sm tracking-wide transition-all duration-200"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <p className="text-sm text-[hsl(215,15%,45%)] text-center mt-6">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="text-[hsl(173,58%,45%)] hover:text-[hsl(173,58%,55%)] font-medium transition-colors"
            >
              Daftar
            </Link>
          </p>

          {/* Mobile slide thumbnails */}
          <div className="lg:hidden mt-8 grid grid-cols-4 gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
                  currentSlide === index
                    ? 'border-[hsl(173,58%,45%)]'
                    : 'border-transparent opacity-60'
                }`}
              >
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-14 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-[hsl(215,25%,18%)]">
            <p className="text-[hsl(215,15%,35%)] text-xs text-center">
              PT Creative Shoot Indonesia · creativeshoot.net
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

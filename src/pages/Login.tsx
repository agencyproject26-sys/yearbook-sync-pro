import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, Eye, EyeOff } from 'lucide-react';
import yearbookHero from '@/assets/yearbook-hero.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login gagal',
        description: error.message
      });
    } else {
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang kembali!'
      });
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img
          src={yearbookHero}
          alt="Creative Shoot - Foto buku tahunan sekolah"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,28%,12%)]/80 via-[hsl(215,28%,12%)]/50 to-[hsl(173,58%,39%)]/30" />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-[hsl(173,58%,39%)] p-2.5 rounded-xl">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">
              CREATIVE SHOOT
            </span>
          </div>

          {/* Bottom - Tagline */}
          <div className="max-w-lg">
            <h1 className="text-white font-display text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Buku Tahunan
              <span className="block text-[hsl(173,58%,45%)]">Sekolah</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Menghadirkan karya kreatif, elegan, dan penuh cerita di setiap halaman. Setiap momen berharga terekam sempurna.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(173,58%,45%)]" />
                <span className="text-white/60 text-sm">Berbadan Hukum Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(173,58%,45%)]" />
                <span className="text-white/60 text-sm">Sejak 2016</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(173,58%,45%)]" />
                <span className="text-white/60 text-sm">Tim Profesional</span>
              </div>
            </div>
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
            <Link to="/register" className="text-[hsl(173,58%,45%)] hover:text-[hsl(173,58%,55%)] font-medium transition-colors">
              Daftar
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-[hsl(215,25%,18%)]">
            <p className="text-[hsl(215,15%,35%)] text-xs text-center">
              PT Creative Shoot Indonesia · creativeshoot.net
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

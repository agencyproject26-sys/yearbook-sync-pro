import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Enhanced password validation
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password minimal 8 karakter';
    if (!/[A-Z]/.test(pwd)) return 'Password harus mengandung huruf kapital';
    if (!/[a-z]/.test(pwd)) return 'Password harus mengandung huruf kecil';
    if (!/[0-9]/.test(pwd)) return 'Password harus mengandung angka';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password harus mengandung karakter spesial (!@#$%^&*(),.?":{}|<>)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password tidak cocok',
        description: 'Pastikan password dan konfirmasi password sama'
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        variant: 'destructive',
        title: 'Password tidak valid',
        description: passwordError
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registrasi gagal',
        description: error.message
      });
    } else {
      toast({
        title: 'Registrasi berhasil',
        description: 'Akun Anda telah dibuat. Silakan tunggu approval dari admin.'
      });
      navigate('/login');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Daftar Akun</CardTitle>
          <CardDescription>Buat akun baru untuk mengakses CRM</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 karakter, huruf besar, kecil, angka, spesial"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password harus minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter spesial.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

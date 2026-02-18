import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";

export default function Profile() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil erfolgreich aktualisiert!");
      utils.profile.get.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio((user as any).bio || "");
      setProfileSlug((user as any).profileSlug || "");
    }
  }, [user]);

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      bio: bio || undefined,
      profileSlug: profileSlug || undefined,
    });
  };

  const publicUrl = profileSlug
    ? `${window.location.origin}/p/${profileSlug}`
    : null;

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link in Zwischenablage kopiert!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Bitte melde dich an, um dein Profil zu bearbeiten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-6">
          <PageBreadcrumb segments={[{ label: "Profil" }]} />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Profil-Einstellungen</h1>
              <p className="text-muted-foreground">Verwalte dein Profil und deine öffentliche Präsenz</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <div className="space-y-8">
          {/* Personal Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Informationen
              </CardTitle>
              <CardDescription>
                Diese Informationen werden auf deinem öffentlichen Profil angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Dein vollständiger Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Kurzbeschreibung</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Erzähle etwas über dich, deine Qualifikationen und Interessen..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  Die E-Mail-Adresse wird über dein Login-Konto verwaltet
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Public Profile */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Öffentliches Profil
              </CardTitle>
              <CardDescription>
                Erstelle eine eindeutige URL für dein öffentliches Zertifikatsportfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="slug">Profil-URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {window.location.origin}/p/
                  </span>
                  <Input
                    id="slug"
                    placeholder="dein-name"
                    value={profileSlug}
                    onChange={(e) => setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt. Mindestens 3 Zeichen.
                </p>
              </div>

              {publicUrl && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Dein öffentlicher Link</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background/50">
                      <code className="flex-1 text-sm text-primary truncate">
                        {publicUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Teile diesen Link in Bewerbungen, auf Social Media oder in deinem Lebenslauf
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Abbrechen</Link>
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Profil speichern
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users, Crown, TrendingUp, Ticket, CheckCircle, Clock,
  DollarSign, BarChart3, Activity, Search, ChevronLeft,
  ChevronRight, RefreshCw, Mail, Zap, Database
} from "lucide-react";

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <p className="text-muted-foreground text-sm text-center py-8">Sem dados de cadastros ainda</p>;
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-40 px-2">
      {data.map((d, i) => {
        const height = Math.max((d.count / maxCount) * 100, 4);
        const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative">
            <div
              className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm transition-all hover:from-amber-600 hover:to-amber-500 cursor-pointer"
              style={{ height: `${height}%`, minHeight: "4px" }}
              title={`${dateLabel}: ${d.count} cadastro(s)`}
            />
            {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
              <span className="text-[9px] text-muted-foreground mt-1 truncate w-full text-center">{dateLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setUserPage(1);
    // Simple debounce
    setTimeout(() => setDebouncedSearch(val), 300);
  };

  // Queries
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: user?.role === "admin" });
  const signups = trpc.admin.signupsByDay.useQuery({ days: 30 }, { enabled: user?.role === "admin" });
  const usersList = trpc.admin.users.useQuery(
    { page: userPage, pageSize: 15, search: debouncedSearch || undefined },
    { enabled: user?.role === "admin" }
  );
  const activity = trpc.admin.recentActivity.useQuery(undefined, { enabled: user?.role === "admin" });
  const revenue = trpc.admin.revenue.useQuery(undefined, { enabled: user?.role === "admin" });

  // Admin actions
  const dispararEmail = trpc.email.dispararDiario.useMutation({
    onSuccess: (data) => toast.success(`${data.sent} e-mails disparados com sucesso!`),
    onError: () => toast.error("Falha ao enviar e-mails."),
  });
  const executarChecker = trpc.autoChecker.executar.useMutation({
    onSuccess: (data) => toast.success(`${data.checked} apostas conferidas, ${data.notified} usuários notificados.`),
    onError: () => toast.error("Falha ao executar conferidor."),
  });

  const totalPages = useMemo(() => Math.ceil((usersList.data?.total ?? 0) / 15), [usersList.data?.total]);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-2">Esta área é exclusiva para administradores.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-amber-500" />
                Painel Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Visão geral do Valtor Loterias</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => executarChecker.mutate()}
                disabled={executarChecker.isPending}
              >
                <Zap className="h-4 w-4 mr-1" />
                {executarChecker.isPending ? "Conferindo..." : "Conferir Apostas"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispararEmail.mutate()}
                disabled={dispararEmail.isPending}
              >
                <Mail className="h-4 w-4 mr-1" />
                {dispararEmail.isPending ? "Enviando..." : "Disparar E-mails"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  overview.refetch();
                  signups.refetch();
                  usersList.refetch();
                  activity.refetch();
                  revenue.refetch();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {overview.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : (
            <>
              <StatCard
                title="Total Usuários"
                value={overview.data?.totalUsers ?? 0}
                subtitle={`${overview.data?.premiumUsers ?? 0} premium`}
                icon={Users}
                color="bg-blue-500"
              />
              <StatCard
                title="Assinantes Ativos"
                value={overview.data?.activeSubscriptions ?? 0}
                subtitle={`de ${overview.data?.totalSubscriptions ?? 0} total`}
                icon={Crown}
                color="bg-amber-500"
              />
              <StatCard
                title="Apostas Registradas"
                value={overview.data?.totalBets ?? 0}
                subtitle={`${overview.data?.pendingBets ?? 0} pendentes`}
                icon={Ticket}
                color="bg-green-500"
              />
              <StatCard
                title="Concursos no DB"
                value={overview.data?.totalConcursos ?? 0}
                subtitle={`${overview.data?.totalSimulations ?? 0} simulações`}
                icon={Database}
                color="bg-purple-500"
              />
              <StatCard
                title="Receita Mensal"
                value={`R$ ${(revenue.data?.monthlyRevenue ?? 0).toFixed(2)}`}
                subtitle={`${revenue.data?.activeCount ?? 0} assinante(s)`}
                icon={DollarSign}
                color="bg-emerald-500"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signups Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Cadastros — Últimos 30 dias
              </CardTitle>
              <CardDescription>
                Total: {signups.data?.reduce((acc, d) => acc + d.count, 0) ?? 0} novos cadastros
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signups.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <MiniBarChart data={signups.data ?? []} />
              )}
            </CardContent>
          </Card>

          {/* Revenue & Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Receita e Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-emerald-600">R$ {(revenue.data?.totalRevenue ?? 0).toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold text-amber-600">R$ {(revenue.data?.monthlyRevenue ?? 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Recent Subscriptions */}
              <div>
                <p className="text-sm font-medium mb-2">Assinaturas Recentes</p>
                {activity.data?.recentSubscriptions?.length ? (
                  <div className="space-y-2">
                    {activity.data.recentSubscriptions.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                            {sub.status === "active" ? "Ativa" : sub.status === "cancelled" ? "Cancelada" : "Expirada"}
                          </Badge>
                          <span>{sub.planType}</span>
                        </div>
                        <span className="text-muted-foreground">R$ {Number(sub.priceMonthly).toFixed(2)}/mês</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma assinatura ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Usuários Cadastrados
                </CardTitle>
                <CardDescription>{usersList.data?.total ?? 0} usuário(s) no total</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersList.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-3 px-2 font-medium text-muted-foreground">ID</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Nome</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">E-mail</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Plano</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Role</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">E-mail Opt-in</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Cadastro</th>
                        <th className="py-3 px-2 font-medium text-muted-foreground">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.data?.data.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2 font-mono text-xs">{u.id}</td>
                          <td className="py-3 px-2 font-medium">{u.name || "—"}</td>
                          <td className="py-3 px-2 text-muted-foreground">{u.email || "—"}</td>
                          <td className="py-3 px-2">
                            <Badge variant={u.layer === "3" ? "default" : "secondary"} className={u.layer === "3" ? "bg-amber-500 hover:bg-amber-600" : ""}>
                              {u.layer === "3" ? "Premium" : "Grátis"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={u.role === "admin" ? "destructive" : "outline"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {u.emailOptIn ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </td>
                          <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                          <td className="py-3 px-2 text-xs text-muted-foreground">{formatDate(u.lastSignedIn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {userPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                        disabled={userPage >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Últimos Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : activity.data?.recentUsers?.length ? (
                <div className="space-y-2">
                  {activity.data.recentUsers.slice(0, 10).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {(u.name || "?")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={u.layer === "3" ? "default" : "secondary"} className={`text-xs ${u.layer === "3" ? "bg-amber-500" : ""}`}>
                          {u.layer === "3" ? "Premium" : "Free"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum cadastro recente</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Bets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4 text-green-500" />
                Apostas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : activity.data?.recentBets?.length ? (
                <div className="space-y-2">
                  {activity.data.recentBets.slice(0, 10).map((bet) => (
                    <div key={bet.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                          {bet.loteriaSlug.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{bet.loteriaSlug.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
                          <p className="text-xs text-muted-foreground">
                            {(bet.dezenas as number[])?.slice(0, 6).join(", ")}{(bet.dezenas as number[])?.length > 6 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {bet.conferido ? (
                          <Badge variant="default" className="bg-green-500 text-xs">
                            {bet.acertos ?? 0} acertos
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Pendente</Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">User #{bet.userId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma aposta registrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

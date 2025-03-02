import LoginForm from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function LoginPage() {

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm/>
        </CardContent>
      </Card>
    </div>
  )

}

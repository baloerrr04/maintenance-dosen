import RegisterForm from "@/components/RegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function RegisterPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm/>
        </CardContent>
      </Card>
    </div>
  )

}

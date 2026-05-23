import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation";

interface TitlePageProps {
  title: string;
  description: string;
  hasBackButton?: boolean;
}

const TitlePage = ({ title, description, hasBackButton = false }: TitlePageProps) => {
const route = useRouter()
  return (
    <div className="mb-4">

        {hasBackButton && (
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />
              <p>Go back</p>
          </div>
        )}
        <h1 className="text-3xl font-bold text-primary">{title}</h1>

      
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default TitlePage;
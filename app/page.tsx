import Collection from './collection';
export default function Home(){return <Collection config={{url:process.env.NEXT_PUBLIC_SUPABASE_URL||'',key:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||''}}/>;}

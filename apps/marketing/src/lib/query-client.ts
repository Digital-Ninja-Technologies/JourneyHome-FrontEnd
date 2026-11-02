import { getContext } from "./query/root-provider";

export {
  default as TanstackQueryProvider,
  getContext,
} from "./query/root-provider";

export function makeQueryClient() {
  return getContext().queryClient;
}

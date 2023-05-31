/**
 * This middleware is needed to fill in the args for nested objects,
 * so that required arguments would work
 * otherwise yargs just throws an error
 */
export const fillInArgs = (
  args: Record<string, unknown>,
  currentArgs: Record<string, unknown> = args,
  acc: string[] = []
) => {
  Object.entries(currentArgs).forEach(([k, v]) => {
    if (k === '_') {
      return;
    }
    // check if the value is an Object
    if (typeof v === 'object' && v !== null) {
      fillInArgs(args, v as any, [...acc, k]);
    } else if (acc.length > 0) {
      // if it's not an object, and we have a path, fill it in
      args[acc.join('.') + '.' + k] = v;
    }
  });
};

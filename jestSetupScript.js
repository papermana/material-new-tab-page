window.chrome = {
  i18n: {
    getMessage: jest.fn((message, args) => {
      if (args instanceof Array) {
        args = args.join('|');
      }

      return message + '|' + args;
    }),
  },
};

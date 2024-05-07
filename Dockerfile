FROM ruby:2.7.3
COPY Gemfile Gemfile
RUN bundle install

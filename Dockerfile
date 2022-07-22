FROM ruby:2.7.3-slim
COPY Gemfile Gemfile
RUN bundle install

'use client';

import Section from '../section';
import Container from '../container';
import BlogsSearch from './blogs-search';
import BlogsFilters from './blogs-filters';

const BlogsUtilityBar = () => {
  return (
    <Section className="bg-slate-950">
      <Container className="w-full py-5 flex lg:items-center justify-between flex-col lg:flex-row gap-10">
        <BlogsSearch />
        <BlogsFilters />
      </Container>
    </Section>
  );
};

export default BlogsUtilityBar;
